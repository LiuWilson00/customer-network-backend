import {Injectable, NotFoundException, Query} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Like, Repository} from 'typeorm';
import {PolicyholderEntity} from '../../common/models/policyholder.entity';
import {CreatePolicyholderDTO} from './dto/create-policyholder.dto';
import {ListPolicyholdersDTO} from './dto/list-policyholders.dto';
import {UpdatePolicyholderDTO} from './dto/update-policyholder.dto';

type side = 'left' | 'right';

@Injectable()
export class PolicyholderService {
  constructor(
    @InjectRepository(PolicyholderEntity)
    private policyholderRepository: Repository<PolicyholderEntity>,
  ) {}

  async getChild(
    node: PolicyholderEntity,
    side: side,
  ): Promise<PolicyholderEntity> {
    const childId = node[side + 'ChildId'];
    if (childId) {
      return this.policyholderRepository.findOne({
        where: {id: childId},
        relations: ['leftChild', 'rightChild'],
      });
    }
    return null;
  }
  async getChilds(node: PolicyholderEntity) {
    const [leftChild, rightChild] = await Promise.all([
      this.getChild(node, 'left'),
      this.getChild(node, 'right'),
    ]);
    return [leftChild, rightChild];
  }

  async nodeCountOfTree(
    node: PolicyholderEntity,
    cache: Map<number, number>,
  ): Promise<{count: number; newCache: Map<number, number>}> {
    if (!node) {
      return {count: 0, newCache: cache};
    }

    if (cache.has(node.id)) {
      return {count: cache.get(node.id), newCache: cache};
    }

    const [leftChild, rightChild] = await this.getChilds(node);

    const [leftResult, rightResult] = await Promise.all([
      this.nodeCountOfTree(leftChild, cache),
      this.nodeCountOfTree(rightChild, cache),
    ]);
    const count = 1 + leftResult.count + rightResult.count;
    const newCache = new Map<number, number>([
      ...leftResult.newCache,
      ...rightResult.newCache,
    ]);
    newCache.set(node.id, count);
    return {count, newCache};
  }

  async findMinNode(
    node: PolicyholderEntity,
    cache: Map<number, number>,
  ): Promise<{
    parent: PolicyholderEntity;
    childNode: side;
    newCache: Map<number, number>;
  }> {
    const _leftChild = await this.getChild(node, 'left');
    const _rightChild = await this.getChild(node, 'right');

    const [leftResult, rightResult] = await Promise.all([
      this.nodeCountOfTree(_leftChild, cache),
      this.nodeCountOfTree(_rightChild, cache),
    ]);

    const leftNodeCount = leftResult.count;
    const rightNodeCount = rightResult.count;
    const newCache = new Map<number, number>([
      ...leftResult.newCache,
      ...rightResult.newCache,
    ]);
    if (leftNodeCount === 0) {
      return {parent: node, childNode: 'left', newCache};
    }

    if (rightNodeCount === 0) {
      return {parent: node, childNode: 'right', newCache};
    }

    if (leftNodeCount > rightNodeCount) {
      const result = await this.findMinNode(_rightChild, newCache);
      return {...result, newCache: new Map([...newCache, ...result.newCache])};
    }

    const result = await this.findMinNode(_leftChild, newCache);
    return {...result, newCache: new Map([...newCache, ...result.newCache])};
  }

  async create(
    newPolicyholder: CreatePolicyholderDTO,
  ): Promise<PolicyholderEntity> {
    const policyholder = new PolicyholderEntity();
    policyholder.name = newPolicyholder.name;
    policyholder.joinDate = new Date();

    if (newPolicyholder.introducerId) {
      const introducer = await this.policyholderRepository.findOne({
        where: {
          id: newPolicyholder.introducerId,
        },
        relations: ['leftChild', 'rightChild'],
      });

      if (!introducer) {
        throw new NotFoundException(
          `Introducer with ID ${newPolicyholder.introducerId} not found.`,
        );
      }

      // Create a new cache for each create operation
      const localNodeCountCache = new Map<number, number>();

      // 根據二元樹的原理找到要插入的位置
      const {parent, childNode} = await this.findMinNode(
        introducer,
        localNodeCountCache,
      );

      policyholder.introducerId = newPolicyholder.introducerId;
      policyholder.parentId = parent.id;

      // 保存新節點
      const newPolicyholderEntity = await this.policyholderRepository.save(
        policyholder,
      );

      // 更新父節點的左或右子節點
      if (childNode === 'left') {
        parent.leftChildId = newPolicyholderEntity.id;
      } else {
        parent.rightChildId = newPolicyholderEntity.id;
      }
      await this.policyholderRepository.save(parent);

      return newPolicyholderEntity;
    } else {
      // 如果 introducerId 為空，將新節點設為根節點
      policyholder.introducerId = null;
      const newRoot = await this.policyholderRepository.save(policyholder);
      return newRoot;
    }
  }

  async update(
    id: number,
    updatePolicyholderDTO: UpdatePolicyholderDTO,
  ): Promise<PolicyholderEntity> {
    const policyholder = await this.policyholderRepository.findOne({
      where: {id: id},
    });

    if (!policyholder) {
      throw new NotFoundException(`Policyholder with ID ${id} not found.`);
    }

    if (updatePolicyholderDTO.name) {
      policyholder.name = updatePolicyholderDTO.name;
    }

    if (updatePolicyholderDTO.introducerId) {
      const introducer = await this.policyholderRepository.findOne({
        where: {id: updatePolicyholderDTO.introducerId},
      });

      if (!introducer) {
        throw new NotFoundException(
          `Introducer with ID ${updatePolicyholderDTO.introducerId} not found.`,
        );
      }
      policyholder.introducerId = updatePolicyholderDTO.introducerId;
    }

    if (updatePolicyholderDTO.parentId) {
      const parent = await this.policyholderRepository.findOne({
        where: {id: updatePolicyholderDTO.parentId},
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent with ID ${updatePolicyholderDTO.parentId} not found.`,
        );
      }
      policyholder.parentId = updatePolicyholderDTO.parentId;
    }

    if (updatePolicyholderDTO.leftChildId) {
      const leftChild = await this.policyholderRepository.findOne({
        where: {id: updatePolicyholderDTO.leftChildId},
      });

      if (!leftChild) {
        throw new NotFoundException(
          `Left child with ID ${updatePolicyholderDTO.leftChildId} not found.`,
        );
      }
      policyholder.leftChildId = updatePolicyholderDTO.leftChildId;
    }

    if (updatePolicyholderDTO.rightChildId) {
      const rightChild = await this.policyholderRepository.findOne({
        where: {id: updatePolicyholderDTO.rightChildId},
      });

      if (!rightChild) {
        throw new NotFoundException(
          `Right child with ID ${updatePolicyholderDTO.rightChildId} not found.`,
        );
      }
      policyholder.rightChildId = updatePolicyholderDTO.rightChildId;
    }

    const updatedPolicyholder = await this.policyholderRepository.save(
      policyholder,
    );
    return updatedPolicyholder;
  }

  async list(@Query() listPolicyholdersDTO: ListPolicyholdersDTO): Promise<{
    data: PolicyholderEntity[];
    totalPages: number;
    totalItems: number;
  }> {
    const {page = 1, pageSize = Number.MAX_SAFE_INTEGER} = listPolicyholdersDTO;
    const [data, totalItems] = await this.policyholderRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        name: Like(`%${listPolicyholdersDTO.name || ''}%`),
        parentId: listPolicyholdersDTO.parentId,
        introducerId: listPolicyholdersDTO.introducerId,
      },
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data,
      totalPages,
      totalItems,
    };
  }
  async deletePolicyholder(id: number): Promise<void> {
    await this.policyholderRepository.update(id, {isDeleted: true});
  }

  async deletePolicyholders(ids: number[]): Promise<void> {
    await this.policyholderRepository
      .createQueryBuilder()
      .update(PolicyholderEntity)
      .set({isDeleted: true})
      .whereInIds(ids)
      .execute();
  }

  async getDescendants(
    id: number | null,
    depth: number,
  ): Promise<PolicyholderEntity | null> {
    if (depth <= 0 || id === null) {
      return null;
    }

    const policyholder = await this.policyholderRepository.findOne({
      where: {id: id},
      relations: ['leftChild', 'rightChild'],
    });

    if (!policyholder) {
      return null;
    }

    policyholder.leftChild = await this.getDescendants(
      policyholder.leftChildId,
      depth - 1,
    );
    policyholder.rightChild = await this.getDescendants(
      policyholder.rightChildId,
      depth - 1,
    );

    return policyholder;
  }
}
