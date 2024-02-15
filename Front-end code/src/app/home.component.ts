import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
 selector: 'home',
 templateUrl: './home.component.html',
 styleUrls: ['./home.component.css']
})

// Class the controls the home page
export class HomeComponent {
    constructor(public authService: AuthService) {}

   }


