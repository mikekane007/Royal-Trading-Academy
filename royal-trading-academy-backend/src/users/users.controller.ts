import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activate(id);
  }
}