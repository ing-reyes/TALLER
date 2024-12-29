import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./../../common/config/base.entity";
import { CustomerEntity } from "./../../customers/entities/customer.entity";
import { EmployeeEntity } from "./../../employees/entities/employee.entity";
import { ShipperEntity } from "./../../shippers/entities/shipper.entity";

@Entity({ name: "order" })
export class OrderEntity extends BaseEntity {
    @Column({ type: "timestamp", nullable: false })
    orderDate: Date;

    @ManyToOne(() => CustomerEntity, (customer) => customer.orders)
    customer:string;
    
    @ManyToOne(() => EmployeeEntity, (employee) => employee.orders)
    employee:string;
    
    @ManyToOne(()=> ShipperEntity, (shipper) => shipper.orders)
    shipper:string;
}