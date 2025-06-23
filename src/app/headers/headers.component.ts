import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerSignupService } from '../services/seller-signup.service';
import { CustomerSignupService } from '../services/customer-signup.service';
import { ShopService } from '../services/shop.service';
import { Product } from '../models/dataTypes';

@Component({
  selector: 'app-headers', // Selector for the component
  templateUrl: './headers.component.html', // Template file for the component
  styleUrl: './headers.component.css' // Stylesheet for the component
})
export class HeadersComponent implements OnInit {

  // Default menu type, can be 'default', 'seller', or 'customer'
  public menuType: string = 'default';

  // Stores the username of the logged-in user
  public userName: string = '';

  // Flag to toggle visibility of certain elements
  public isHidden: boolean = false;

  // Stores search results, can be undefined or an array of Product objects
  public searchResults: undefined | Product[];

  // Stores the count of items in the cart
  public cartCount: number = 0;

  // Constructor to inject required services and the router
  constructor(
    private router: Router,
    private sellerSignupService: SellerSignupService,
    private customerSignupService: CustomerSignupService,
    private shopService: ShopService
  ) {}

  // Lifecycle hook that runs after the component is initialized
  ngOnInit(): void {
    // Subscribe to router events to detect URL changes
    this.router.events.subscribe((res: any) => {
      if (res.url) {
        // Retrieve seller data from local storage
        let sellerStore = localStorage.getItem('admin');
        let sellerData = sellerStore && JSON.parse(sellerStore);

        // Retrieve customer data from local storage
        let customerStore = localStorage.getItem('customer');
        let customerData = customerStore && JSON.parse(customerStore);

        // If seller data exists and the URL includes 'products', set menu type to 'seller'
        if (sellerData && res.url.includes('products')) {
          this.sellerSignupService.getUser(sellerData).subscribe((res) => {
            this.userName = res.username; // Set the username for the seller
            this.menuType = 'seller';    // Set the menu type to 'seller'
          });
        }
        // If customer data exists, set menu type to 'customer'
        else if (customerData) {
          this.customerSignupService.getUser(customerData).subscribe((res) => {
            this.userName = res.username; // Set the username for the customer
            this.menuType = 'customer';  // Set the menu type to 'customer'
          });
        }
        // If no user data exists, set menu type to 'default'
        else {
          this.menuType = 'default';
        }
      }
    });

    // Retrieve cart data from local storage and set the cart count
    let cartData = localStorage.getItem('localCart');
    if (cartData) {
      this.cartCount = JSON.parse(cartData).length; // Set the cart count to the length of the local cart data
    }

    // Fetch the cart count for a logged-in customer
    let user = localStorage.getItem('customer');
    if (user) {
      this.shopService.getCartCount(); // Fetch the cart count from the shop service
    }

    // Subscribe to the cart data length observable to update the cart count dynamically
    this.shopService.cartDataLength.subscribe((res) => {
      this.cartCount = res.length; // Update the cart count with the latest data
    });
  }

  // Method to handle customer logout functionality
  onCustomerLogout() {
    localStorage.removeItem('customer'); // Remove customer data from local storage
    this.router.navigate(['/']); // Navigate to the home page
    this.shopService.cartDataLength.emit([]); // Clear the cart data
  }

  // Method to handle seller logout functionality
  onSellerLogout() {
    localStorage.removeItem('admin'); // Remove seller data from local storage
    this.router.navigate(['/']); // Navigate to the home page
  }

  // Method to handle search functionality
  onSearch(searchVal: string) {
    this.router.navigate([`/search/${searchVal}`]); // Navigate to the search results page
  }

  // Method to search for products based on user input
  searchProduct(queryEventData: KeyboardEvent) {
    if (queryEventData) {
      let element = queryEventData.target as HTMLInputElement; // Get the input element
      this.shopService.searchProducts(element.value).subscribe((res) => {
        if (res.length > 5) {
          res.length = 5; // Limit the search results to 5 items
        }
        this.searchResults = res; // Set the search results
      });
    }
  }

  // Method to hide the search results
  hideSearch() {
    this.searchResults = undefined; // Clear the search results
  }

  // Method to redirect to the product details page
  redirectToDetails(productId: string) {
    this.router.navigate([`/product-details/${productId}`]); // Navigate to the product details page
  }
}
