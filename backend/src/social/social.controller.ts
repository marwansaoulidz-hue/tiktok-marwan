import { Controller, Post, Delete, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class SocialController {
  constructor(private social: SocialService) {}

  @UseGuards(JwtAuthGuard)
  @Post('videos/:id/like')
  like(@Request() req: any, @Param('id') id: string) {
    return this.social.toggleLike(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('videos/:id/comments')
  comments(@Param('id') id: string) {
    return this.social.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('videos/:id/comments')
  addComment(@Request() req: any, @Param('id') id: string, @Body('content') content: string) {
    return this.social.addComment(req.user.sub, id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  deleteComment(@Request() req: any, @Param('id') id: string) {
    return this.social.deleteComment(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:id/follow')
  follow(@Request() req: any, @Param('id') id: string) {
    return this.social.toggleFollow(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/request/:userId')
  friendRequest(@Request() req: any, @Param('userId') userId: string) {
    return this.social.sendFriendRequest(req.user.sub, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/respond/:requestId')
  respondFriend(@Request() req: any, @Param('requestId') requestId: string, @Body('accept') accept: boolean) {
    return this.social.respondFriendRequest(req.user.sub, requestId, accept);
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends')
  friends(@Request() req: any) {
    return this.social.getFriends(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reports')
  report(@Request() req: any, @Body() body: { videoId: string; reason: string }) {
    return this.social.report(req.user.sub, body.videoId, body.reason);
  }
}
