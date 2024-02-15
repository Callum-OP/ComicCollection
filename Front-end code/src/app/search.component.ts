import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

// Class for showing the search results from the search bar input
export class SearchComponent {

  comic_list: any = [];
  page: number = 1;

  constructor(public webService: WebService, private route: ActivatedRoute) {}

  // On startup the page number is set and the comics search results are retrieved
  ngOnInit() {
    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page'])
    }
    let title = this.route.snapshot.params['title'];
    this.comic_list = this.webService.searchComics(title, this.page);
  }

  // Goes back one page when the previous page button is pressed
  previousPage() {
    if (this.page > 1) {
      this.page = this.page - 1;
      sessionStorage['page'] = this.page
      let title = this.route.snapshot.params['title'];
      this.comic_list = this.webService.searchComics(title, this.page);
    }
  }

  // Goes foward one page when the foward page button is pressed
  nextPage() {
    this.page = this.page + 1;
    sessionStorage['page'] = this.page
    let title = this.route.snapshot.params['title'];
    this.comic_list = this.webService.searchComics(title, this.page);
  }
}
