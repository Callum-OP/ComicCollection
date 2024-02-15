import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { WebService } from './web.service';

@Component({
  selector: 'navigation',
  templateUrl: './nav.component.html',
  styleUrls: []
})

// Class that controls the navbar for the site
export class NavComponent {
  constructor(public authService: AuthService, public router: Router, private webService: WebService) {}

  // Search bar that takes the user to a page with the results of what they searched for
  searchBar(title: any) {
    this.resetPage();
    return window.location.href='http://localhost:4200/search/' + title;
  }

  // Sets page back to 1 so user is on the first page
  resetPage() {
    sessionStorage['page'] = 1;
  }
}
