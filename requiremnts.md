# 📄 Product Requirement Document (PRD)

# Product Name: Radhaan (Working Name)

---

# 1. Overview

## 1.1 Product Summary

ShaadiVault is a modern e-commerce platform that allows users to **rent or purchase Lehengas and Jewellery items** for weddings, festivals, and special occasions.

The platform supports:

- Rental model  
- Purchase model  
- Hybrid model (Rent + Buy option)  
- Admin dashboard for product, inventory, and order management  

---

# 2. Goals & Objectives

## 2.1 Business Goals

- Enable users to rent premium wedding outfits affordably.
- Allow direct purchases for premium customers.
- Maintain accurate inventory tracking for rental availability.
- Build a scalable platform for future expansion (menswear, accessories, etc.).

## 2.2 User Goals

- Easily browse and filter lehengas and jewellery.
- Choose rental duration.
- View availability calendar.
- Secure checkout experience.
- Track orders and rental returns.

---

# 3. Target Users

## 3.1 Bride / Wedding Attendee

- Wants premium lehengas without high purchase cost.
- Needs guaranteed delivery before event date.

## 3.2 Jewellery Buyer

- Wants to purchase artificial or premium jewellery items.

## 3.3 Admin

- Manages product inventory.
- Controls rental stock.
- Handles orders and returns.

---

# 4. Core Features

---

# 4.1 User Features

## 4.1.1 Authentication

- Sign up / Login
- Social login (optional)
- Forgot password
- User profile management

---

## 4.1.2 Product Browsing

### Categories

- Lehengas
- Jewellery
- Bridal Sets
- Occasion-based collections (Wedding, Reception, Festive)

### Filters

- Price range
- Rent / Buy / Both
- Size
- Color
- Availability date (for rentals)
- Ratings

---

## 4.1.3 Product Detail Page

Each product will include:

- Multiple product images
- Title
- Description
- Size options
- Rental price per day
- Purchase price
- Availability calendar
- Security deposit (if applicable)
- Delivery information
- Customer reviews

---

# 4.2 Rental Flow

1. User selects rental dates.
2. System checks product availability.
3. Rental cost is auto-calculated.
4. Security deposit (if applicable) is added.
5. User proceeds to checkout.
6. Delivery tracking enabled.
7. Return status tracking enabled.

---

# 4.3 Purchase Flow

1. User adds product to cart.
2. Proceeds to checkout.
3. Completes payment.
4. Delivery tracking enabled.

---

# 4.4 Cart

The cart should support:

- Rental items
- Purchase items
- Mixed cart (both rental and purchase items together)

Cart should clearly display:

- Rental duration
- Deposit amount
- Final payable amount

---

# 4.5 Order Management (User Dashboard)

Users can:

- View active rentals
- View upcoming deliveries
- Receive return reminders
- View order history
- Download invoices

---

# 5. Admin Dashboard Features

---

# 5.1 Admin Authentication

- Secure admin login
- Role-based access control

---

# 5.2 Product Management

Admin can:

- Add product
- Edit product
- Delete product
- Upload product images
- Set:
  - Rental price
  - Purchase price
  - Deposit
  - Stock count
  - Rental allowed (Yes/No)
  - Purchase allowed (Yes/No)
  - Size variants

---

# 5.3 Inventory Management

For rental products:

- Track booked dates
- Prevent overlapping rentals
- Block dates manually
- View availability calendar
- Track damage status
- Track item return confirmation

---

# 5.4 Order Management

Admin can:

- View all orders
- Filter by:
  - Rental
  - Purchase
  - Mixed
  - Delivered
  - Returned
  - Cancelled
- Update order status
- Mark returned
- Approve deposit refunds
- Handle damaged item penalties

---

# 5.5 Analytics Dashboard

Admin analytics should display:

- Total revenue
- Rental revenue
- Purchase revenue
- Most rented item
- Most sold item
- Monthly growth trends
- Active rentals
- Pending returns

---

# 6. Database Design (High-Level)

---

## 6.1 Users

- id
- name
- email
- role (user/admin)
- address
- phone
- createdAt

---

## 6.2 Products

- id
- title
- description
- category
- images
- rentalPricePerDay
- purchasePrice
- deposit
- stock
- rentalEnabled (boolean)
- purchaseEnabled (boolean)
- sizes
- createdAt

---

## 6.3 Orders

- id
- userId
- items[]
- totalAmount
- orderType (rent / purchase / mixed)
- status
- paymentStatus
- rentalStartDate
- rentalEndDate
- depositStatus
- createdAt

---

## 6.4 RentalBookings

- id
- productId
- startDate
- endDate
- orderId
- returnStatus

---

# 7. User Flow

---

## 7.1 Rental Flow

Home → Product → Select dates → Add to cart → Checkout → Payment → Delivery → Return

---

## 7.2 Purchase Flow

Home → Product → Add to cart → Checkout → Payment → Delivery

---

# 8. Edge Cases & Exceptions

- Overlapping rental dates
- Late return handling
- Damaged item penalty
- Mixed cart checkout validation
- Partial refund cases
- Cancellation before dispatch
- Out-of-stock handling

---

# 9. Key Performance Indicators (KPIs)

- Conversion rate
- Rental-to-purchase ratio
- Average order value
- Return rate
- Repeat customer percentage
- Customer lifetime value

---

# 10. Future Enhancements

- Virtual try-on feature
- AI-based outfit recommendations
- Subscription model
- Dynamic pricing based on demand
- Influencer affiliate dashboard
- Referral and loyalty system
- Wishlist feature
- Mobile application

---

# 11. Security & Compliance

- Secure payment processing
- Role-based access control
- Input validation
- Secure image upload
- API rate limiting
- Data encryption for sensitive information