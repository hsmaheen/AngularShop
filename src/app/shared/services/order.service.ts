import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';

@Injectable()
export class OrderService {
  orderApi = environment.orderApiUrl;
  private orderSubject = new Subject<Order>();
  private customerOrder: Order = new Order();

  constructor(private http: HttpClient,
    private authSvc: AuthService,
    private productSvc: ProductService) {

    this.orderListener()
      .subscribe((orderData) => {
        if ((orderData !== null) || (orderData !== undefined)) {
          this.customerOrder = orderData;
        }
      });

    if (this.authSvc.isLoggedIn()) {
      console.log('Logged in');
      const userID = localStorage.getItem('userID');
      // this.getCartItemsByUserId(userID);

      // this.calculateLocalCartProdCounts();
    } else {
      //  console.log('Not Logged in');
      // this.calculateLocalCartProdCounts();
    }

  }

  orderListener() {
    return this.orderSubject.asObservable();
  }

  updatedOrderSubject(order: Order) {
    console.log('Updating data');
    this.orderSubject.next(order);
  }

  getCartItemforUser() {
    const userID = localStorage.getItem('userID');
    this.getCartItemsByUserId(userID)
      .subscribe((order) => {
        if (order !== null) {
          order.products.forEach(prod => this.productSvc.addProductToLocalCart(prod));
          this.productSvc.getLocalCartProducts();
        }
      });

  }

  getCartItemsByUserId(userId: string): Observable<Order> {
    const getCartItemsUrl = 'order/new/' + userId;
    console.log(this.orderApi + getCartItemsUrl);
    return this.http
      .get<{ order: Order }>(this.orderApi + getCartItemsUrl)
      .map((data) => {
        return data.order;

      });

  }

  addToCart(userId: string, products: Product[]): Observable<Order> {
    const order = { userId: userId, products: products };
    const addToCartUrl = 'order/cart/add';
    return this.http
      .post(this.orderApi + addToCartUrl, order)
      .map((data) => {
        console.log(data);
        return data as Order;
      });
  }

  removeFromCart(userId: string, productIds: Number[]): Observable<Order> {
    const order = { userId: userId, products: productIds };
    console.log(order);
    const addToCartUrl = 'order/cart/remove';
    return this.http
      .post(this.orderApi + addToCartUrl, order)
      .map((data) => {
        return data as Order;
      });
  }

  satisfyOrder() {
    console.log('Satisfy');
    console.log(this.customerOrder);

  }

}
