#include <iostream>
#include <string>
using namespace std;

/*
This file represents the logic used in the JS project:

1. Hash Map -> User Login System
2. Linked List -> Booking History
3. Queue -> Waiting List
4. Binary Search Tree -> Service search by price
*/


// ===============================
// USER STRUCTURE
// ===============================
struct User {
    string name;
    string email;
    string role;
};


// ===============================
// HASH MAP (Simple Representation)
// ===============================
class UserHashMap {
private:
    User users[100];
    int count = 0;

public:

    void addUser(string name, string email, string role) {
        users[count].name = name;
        users[count].email = email;
        users[count].role = role;
        count++;
    }

    User* getUser(string email) {
        for(int i=0;i<count;i++) {
            if(users[i].email == email)
                return &users[i];
        }
        return NULL;
    }

    void displayUsers() {
        cout << "\nRegistered Users:\n";
        for(int i=0;i<count;i++) {
            cout << users[i].name << " - " << users[i].email << endl;
        }
    }
};


// ===============================
// LINKED LIST (Booking History)
// ===============================
struct Booking {
    string service;
    string date;

    Booking* next;
};

class BookingHistory {
private:
    Booking* head = NULL;

public:

    void addBooking(string service, string date) {

        Booking* newBooking = new Booking();
        newBooking->service = service;
        newBooking->date = date;
        newBooking->next = NULL;

        if(head == NULL) {
            head = newBooking;
            return;
        }

        Booking* temp = head;
        while(temp->next != NULL)
            temp = temp->next;

        temp->next = newBooking;
    }

    void showHistory() {

        Booking* temp = head;

        cout << "\nBooking History:\n";

        while(temp != NULL) {
            cout << temp->service << " on " << temp->date << endl;
            temp = temp->next;
        }
    }
};


// ===============================
// QUEUE (WAITING LIST)
// ===============================
class WaitingQueue {

private:

    string queue[50];
    int front = 0;
    int rear = -1;

public:

    void enqueue(string name) {

        rear++;
        queue[rear] = name;
    }

    void dequeue() {

        if(front > rear) {
            cout << "Queue Empty\n";
            return;
        }

        cout << "Serving: " << queue[front] << endl;
        front++;
    }

    void display() {

        cout << "\nWaiting List:\n";

        for(int i=front;i<=rear;i++)
            cout << queue[i] << endl;
    }
};


// ===============================
// BINARY SEARCH TREE (Services)
// ===============================
struct Service {

    string name;
    int price;

    Service* left;
    Service* right;
};

class ServiceBST {

public:

    Service* insert(Service* root, string name, int price) {

        if(root == NULL) {

            Service* newNode = new Service();
            newNode->name = name;
            newNode->price = price;
            newNode->left = newNode->right = NULL;

            return newNode;
        }

        if(price < root->price)
            root->left = insert(root->left, name, price);
        else
            root->right = insert(root->right, name, price);

        return root;
    }

    void inorder(Service* root) {

        if(root == NULL)
            return;

        inorder(root->left);

        cout << root->name << " - Rs." << root->price << endl;

        inorder(root->right);
    }
};


// ===============================
// MAIN PROGRAM
// ===============================
int main() {

    cout << "Nail Studio Booking System (DSA Representation)\n";


    // HASH MAP DEMO
    UserHashMap users;

    users.addUser("Krishna", "krishna@email.com", "client");
    users.addUser("Admin", "admin@email.com", "admin");

    users.displayUsers();


    // LINKED LIST DEMO
    BookingHistory history;

    history.addBooking("Nail Art", "22 May");
    history.addBooking("Manicure", "25 May");

    history.showHistory();


    // QUEUE DEMO
    WaitingQueue waitlist;

    waitlist.enqueue("Riya");
    waitlist.enqueue("Aman");
    waitlist.enqueue("Sita");

    waitlist.display();

    waitlist.dequeue();


    // BST DEMO
    ServiceBST tree;
    Service* root = NULL;

    root = tree.insert(root,"Basic Manicure",500);
    root = tree.insert(root,"Nail Extension",2000);
    root = tree.insert(root,"Gel Polish",900);

    cout << "\nServices Sorted By Price:\n";
    tree.inorder(root);


    return 0;
}