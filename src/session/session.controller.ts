import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Session } from './entities/session.entity';

@ApiBearerAuth()
@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE SESSION', description: 'Create a new session record' })
  @ApiResponse({ status: 201, description: 'Created', type: Session })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL SESSIONS', description: 'List all sessions' })
  @ApiResponse({ status: 200, description: 'OK', type: [Session] })
  findAll() {
    return this.sessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET SESSION BY ID', description: 'Get session details' })
  @ApiResponse({ status: 200, description: 'OK', type: Session })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE SESSION', description: 'Update session details' })
  @ApiResponse({ status: 200, description: 'Updated', type: Session })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(+id, updateSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE SESSION', description: 'Remove a session record' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Session deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.sessionService.remove(+id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'GET SESSIONS BY CUSTOMER', description: 'List all sessions for a customer' })
  @ApiResponse({ status: 200, description: 'OK', type: [Session] })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.sessionService.findByCustomer(+customerId);
  }
}