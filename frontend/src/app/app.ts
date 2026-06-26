import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
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
