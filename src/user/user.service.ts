import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { CreateProviderDto, SignInDto } from 'src/dto/user.dto';
import { UserType } from 'src/types/statics';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async createProvider(dto: CreateProviderDto): Promise<User> {
        const existing = await this.userRepository.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new BadRequestException('Email is already in use');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const provider = this.userRepository.create({
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            type: UserType.PROVIDER,
        } as DeepPartial<User>);

        return await this.userRepository.save(provider);
    }

    async signIn(dto: SignInDto): Promise<{ accessToken: string }> {
        // const user = await this.userRepository.findOne({
        //     where: { email: dto.email.toLowerCase() },
        // });

        const users = await this.userRepository.manager.query(

            `
  SELECT u.*
  FROM users AS u
  WHERE u.email = $1
    AND u.role = 'provider'
  LIMIT 1
  `,
            [dto.email.toLowerCase()] // parameterized for safety
        );

        const user = users[0];
        console.log(user, users);


        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload);

        return { accessToken };
    }
}
