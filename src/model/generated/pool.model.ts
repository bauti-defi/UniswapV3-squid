import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Swap} from "./swap.model"
import {MintPosition} from "./mintPosition.model"
import {DecreasePositionLiquidity} from "./decreasePositionLiquidity.model"
import {CollectionPosition} from "./collectionPosition.model"

@Entity_()
export class Pool {
    constructor(props?: Partial<Pool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("int4", {nullable: false})
    chainId!: number

    @Index_()
    @Column_("text", {nullable: false})
    token0!: string

    @Index_()
    @Column_("text", {nullable: false})
    token1!: string

    @Index_()
    @Column_("int4", {nullable: false})
    fee!: number

    @Index_()
    @Column_("text", {nullable: false})
    poolAddress!: string

    @OneToMany_(() => Swap, e => e.pool)
    swaps!: Swap[]

    @OneToMany_(() => MintPosition, e => e.pool)
    mintPositions!: MintPosition[]

    @OneToMany_(() => DecreasePositionLiquidity, e => e.pool)
    decreasePositionLiquidity!: DecreasePositionLiquidity[]

    @OneToMany_(() => CollectionPosition, e => e.pool)
    collectPositions!: CollectionPosition[]
}
