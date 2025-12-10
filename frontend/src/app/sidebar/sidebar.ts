import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isFinancialOpen = false;
  isInventoryOpen = false;

  toggleFinancial() {
    this.isFinancialOpen = !this.isFinancialOpen;
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
  }
}
