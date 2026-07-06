import { Controller, Get, Query, Param } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private search: SearchService) {}

  @Get()
  searchAll(@Query('q') q: string) {
    return this.search.search(q || '');
  }

  @Get('hashtag/:name')
  byHashtag(@Param('name') name: string) {
    return this.search.searchByHashtag(name);
  }
}
