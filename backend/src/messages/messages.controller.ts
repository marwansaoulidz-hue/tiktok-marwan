import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  conversations(@Request() req: any) {
    return this.messages.getConversations(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations/:userId')
  createConversation(@Request() req: any, @Param('userId') userId: string) {
    return this.messages.getOrCreateConversation(req.user.sub, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id')
  getMessages(@Request() req: any, @Param('id') id: string) {
    return this.messages.getMessages(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations/:id')
  sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { content?: string; gifUrl?: string },
  ) {
    return this.messages.sendMessage(req.user.sub, id, body.content, body.gifUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('gifs')
  searchGifs(@Query('q') q: string) {
    return this.messages.searchGifs(q || 'hello');
  }
}
