import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { SocialModule } from './social/social.module';
import { SearchModule } from './search/search.module';
import { MessagesModule } from './messages/messages.module';
import { LocationsModule } from './locations/locations.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    QueueModule,
    AuthModule,
    UsersModule,
    VideosModule,
    SocialModule,
    SearchModule,
    MessagesModule,
    LocationsModule,
    AdminModule,
  ],
})
export class AppModule {}
