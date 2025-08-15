import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateProviderDto, SignInDto } from 'src/dto/user.dto';
import { User } from 'src/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('provider')
  async createProvider(@Body() dto: CreateProviderDto): Promise<User> {
    return this.userService.createProvider(dto);
  }

  @Get('provider')
  async getProvider(@Body() dto: SignInDto): Promise<{ accessToken: string }> {
    return await this.userService.signIn(dto);
  }
}
