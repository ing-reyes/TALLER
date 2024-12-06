import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination/pagination.dto';
import { ManagerError } from 'src/common/errors/manager.error';
import { ResponseAllUsers } from './interfaces/response-users.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ApiAllResponse, ApiOneResponse } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<ApiOneResponse<UserEntity>> {
        try {
            const user = await this.userRepository.save(createUserDto);
            if (!user) {
                throw new ManagerError({
                    type: 'CONFLICT',
                    message: 'User not created!',
                });
            }
            return {
                status: {
                    statusMsg: "CREATED",
                    statusCode: HttpStatus.CREATED,
                    error: null,
                },
                data: user,
            };
        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('Email not available!');
            }

            ManagerError.createSignatureError(error.message);
        }
    }

    async findAll(paginationDto: PaginationDto): Promise<ApiAllResponse<UserEntity>> {
        const { limit, page } = paginationDto;
        const skip = (page - 1) * limit;
        try {

            const [total, data] = await Promise.all([
                this.userRepository.count({ where: { isActive: true } }),
                this.userRepository.find({ where: { isActive: true }, take: limit, skip: skip }),
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

    async findOne(id: string): Promise<ApiOneResponse<UserEntity>> {
        try {
            const user = await this.userRepository.findOne({ where: { id: id, isActive: true } });
            if (!user) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'User not found',
                });
            }
            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                data: user,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiOneResponse<UpdateResult>> {
        try {
            const user = await this.userRepository.update({ id, isActive: true }, updateUserDto);
            if (user.affected === 0) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'User not found',
                });
            }

            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                data: user,
            };
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async remove(id: string): Promise<ApiOneResponse<UpdateResult>> {
        try {
            const user = await this.userRepository.update({ id, isActive: true }, { isActive: false });
            if (user.affected === 0) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'User not found',
                });
            }

            return {
                status: {
                    statusMsg: "OK",
                    statusCode: HttpStatus.OK,
                    error: null,
                },
                data: user,
            };

        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }

    async findOneByEmail(email: string): Promise<UserEntity> {
        try {
            const user = await this.userRepository.findOne({ where: { email, isActive: true } });
            if (!user) {
                throw new ManagerError({
                    type: 'NOT_FOUND',
                    message: 'User not found',
                });
            }
            return user;
        } catch (error) {
            ManagerError.createSignatureError(error.message);
        }
    }
}
