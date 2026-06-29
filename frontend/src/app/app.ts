import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  template: `
  <pb-navbar />
  <main>
    <router-outlet />
  </main>
  `,
  styles: [
    `
      .app-shell {
        min-height: calc(100vh - 60px);
      }
    `
  ]
})
export class App {
}
