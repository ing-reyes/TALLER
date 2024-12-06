import { HttpStatus, Injectable } from "@nestjs/common";

import { Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { SupplierEntity } from "./entities/supplier.entity";
import { ManagerError } from "./../common/errors/manager.error";
import { PaginationDto } from '../common/dtos/pagination/pagination.dto';
import { ResponseAllSuppliers } from "./interfaces/response-suppliers.interface";
import { ApiAllResponse, ApiOneResponse } from "src/common/interfaces/api-response.interface";

@Injectable()
export class SuppliersService {

    constructor(
        @InjectRepository(SupplierEntity)
        private readonly supplierRepository: Repository<SupplierEntity>,
    ) { }

    async create(createSupplierDto: CreateSupplierDto): Promise<ApiOneResponse<SupplierEntity>> {
        try {
            const supplier = await this.supplierRepository.save(createSupplierDto);

            if (!supplier) {
                throw new ManagerError({
                    type: 'CONFLICT',
                    message: 'Supplier not created!',
                });
            }

            return {
                status: {
                    statusMsg: "CREATED",
                    statusCode: HttpStatus.CREATED,
                    error: null,
                },
                data: supplier,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async findAll(paginationDto: PaginationDto): Promise<ApiAllResponse<SupplierEntity>> {
        const { limit, page } = paginationDto;
        const skip = (page - 1) * limit;
        try {

            const [total, data] = await Promise.all([
                this.supplierRepository.count({ where: { isActive: true } }),
                this.supplierRepository.find({ where: { isActive: true }, take: limit, skip: skip }),
            ]);

            const lastPage = Math.ceil(total / limit);

            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                meta: {
                    page,
                    limit,
                    lastPage,
                    total,
                },
                data,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async findOne(id: string): Promise<ApiOneResponse<SupplierEntity>> {
        try {
            const supplier = await this.supplierRepository.findOne({ where: { id: id, isActive: true } });
            if (!supplier) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'Supplier not found',
                });
            }
            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                data: supplier,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<ApiOneResponse<UpdateResult>> {
        try {
            const supplier = await this.supplierRepository.update({ id, isActive: true }, updateSupplierDto);
            if (supplier.affected === 0) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'Supplier not found',
                });
            }

            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                data: supplier,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async remove(id: string): Promise<ApiOneResponse<UpdateResult>> {
        try {
            const supplier = await this.supplierRepository.update({ id, isActive: true }, { isActive: false });
            if (supplier.affected === 0) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'Supplier not found',
                });
            }

            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                data: supplier,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }
}