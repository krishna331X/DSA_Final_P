# DSA_Final_P

# Nail Studio Booking System (DSA Based Web Application)

## Project Overview

This project is a **Nail Studio Booking Website** developed to demonstrate the use of **Data Structures and Algorithms (DSA)** in a practical web application.

The system allows users to:
- Register and login
- Browse available nail services
- Book appointments
- View recommendations
- Manage bookings through an admin dashboard

The project is mainly implemented using **JavaScript for the web interface** and **C++ representation to explain the DSA concepts used internally**.

The goal of this project is to show how real-world applications can use data structures to improve **searching, booking management, and user handling efficiency.**

---

# System Features

### 1. User Authentication
Users can register and login to the system.

- New users can create accounts
- Existing users can log in
- Admin users have access to management tools

---

### 2. Service Browsing
Users can view all available nail services such as:

- Manicure
- Pedicure
- Nail Art
- Gel Nails
- Spa Treatments

Each service includes:
- Name
- Price
- Duration
- Description

Users can also search services using the search bar.

---

### 3. Booking System
Users can book appointments by selecting:

- A service
- Date
- Time slot
- Payment method

The system prevents double bookings by checking existing appointments.

---

### 4. Admin Dashboard
Admins can manage the system through the dashboard:

- View all bookings
- Confirm or cancel bookings
- Manage services
- Track revenue
- View client information

---

# Data Structures Used

This project demonstrates multiple DSA concepts used in real applications.

---

## 1. Hash Map – User Management

Used for fast user lookup during login.

Key:  
User Email

Value:  
User Object (name, password, role)

Time Complexity:

O(1) average lookup

Purpose:
- Quickly find users during login
- Avoid scanning all users

---

## 2. Binary Search Tree (BST) – Service Management

Services are stored in a **Binary Search Tree based on price**.

This allows:
- Efficient sorting
- Range queries
- Fast service filtering

Example use:
Finding services between two price ranges.

---

## 3. Trie – Service Search

A **Trie data structure** is used for service search and autocomplete.

Example:
Typing "nai" will quickly find:

- Nail Art
- Nail Extension
- Nail Repair

Benefit:
Fast prefix-based searching.

---

## 4. Min Heap (Priority Queue) – Booking Scheduling

Bookings are stored in a **Min Heap** where priority is determined by:

Date + Time

This ensures that:
- Earliest bookings are processed first
- Admin dashboard can show upcoming bookings efficiently

Time Complexity:

Insertion: O(log n)

---

## 5. Linked List – Client Booking History

Each client has a **linked list** that stores their booking history.

This allows:
- Efficient insertion of new bookings
- Easy traversal of past bookings

---

## 6. Graph – Service Recommendations

A **graph structure** is used to represent relationships between services.

Example:

If users often book:
Manicure → Pedicure

The system will recommend Pedicure when Manicure is selected.

Graph Nodes:
Services

Graph Edges:
Frequently booked together services

---

## 7. Queue – Waiting List

A queue is used for managing a **waiting list system**.

Principle used:

FIFO (First In First Out)

Example:

If a slot is full:
- Customer joins the waiting queue
- First customer in queue gets the next available slot.

---

# Project Architecture

The project is divided into several modules:

### 1. Authentication Module
Handles login and registration.

### 2. Booking Module
Handles appointment scheduling and booking confirmation.

### 3. Admin Module
Manages bookings, services, and revenue.

### 4. Data Module
Contains the implementation of all major **data structures**.

---

# Technologies Used

Frontend:
- HTML
- CSS
- JavaScript

Conceptual Implementation:
- C++ (for demonstrating DSA structures)

Data Structures Used:
- Hash Map
- Binary Search Tree
- Trie
- Min Heap
- Linked List
- Graph
- Queue

---

# Learning Objectives

This project demonstrates how **Data Structures and Algorithms can be applied to real-world applications.**

Key learning outcomes:

- Applying DSA concepts in web systems
- Efficient searching and filtering
- Managing bookings using priority structures
- Using graphs for recommendation systems
- Organizing user data with hash maps

---

# Conclusion

The Nail Studio Booking System is a practical demonstration of how multiple **data structures work together** to create an efficient and scalable system.

By combining web development with DSA concepts, this project shows how theoretical algorithms can be applied to real-world software solutions.
