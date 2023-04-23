import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('policyholders')
export class PolicyholderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'varchar', length: 255})
  name: string;

  @CreateDateColumn({type: 'timestamp'})
  joinDate: Date;

  @Column({type: 'int', nullable: true})
  introducerId: number;

  // 上一層保戶關係
  @ManyToOne(
    () => PolicyholderEntity,
    (policyholder) => policyholder.childrens,
    {
      nullable: true,
    },
  )
  @JoinColumn({name: 'parentId'})
  parent: PolicyholderEntity;

  @OneToMany(() => PolicyholderEntity, (policyholder) => policyholder.parent)
  childrens: PolicyholderEntity[];

  @Column({type: 'int', nullable: true})
  parentId: number;

  // 左子樹保戶關係
  @OneToOne(() => PolicyholderEntity, {nullable: true})
  @JoinColumn({name: 'leftChildId'})
  leftChild: PolicyholderEntity;

  @Column({type: 'int', nullable: true})
  leftChildId: number;

  // 右子樹保戶關係
  @OneToOne(() => PolicyholderEntity, {nullable: true})
  @JoinColumn({name: 'rightChildId'})
  rightChild: PolicyholderEntity;

  @Column({type: 'int', nullable: true})
  rightChildId: number;

  @Column({type: 'boolean', default: false})
  isDeleted: boolean;
}
