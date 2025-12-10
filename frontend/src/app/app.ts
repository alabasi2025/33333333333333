import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { UnitSelectorComponent } from './components/unit-selector/unit-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, UnitSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
