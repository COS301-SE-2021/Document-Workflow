import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { User } from './../Interfaces/user';
import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _storage: Storage;
  constructor(private storage: Storage, private http: HttpClient) {
    this.init();
  }

  getUserFromServer(id: string){
    return this.http.get<{id: string, name: string, surname: string, email: string}>('http://localhost:3000/api/users/' + id);
  }

  postUserLogin(id: string, password: string){
    return this.http.post<{id: string, token: string}>('http://localhost:3000/api/users/login/' + id, {password: password});
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async initUser() {
    const users: User[] = [
      {
        id: 1,
        Fname: 'Brent',
        Lname: 'Stroberg',
        initials: 'BP',
        email: 'u17015741@tuks.co.za',
        phone_number: '0763398714',
        password: 'submarine',
      },
    ];
    await this.storage.set('users', users);
  }

  async login(email: string, password: string): Promise<boolean>{
    let users = await this._storage?.get('users');
    if (!users) {
      users =  await this.initUser();
      this.login(email, password);
    }

    const index = users.findIndex(x => x.email === email && x.password === password);
    console.log(index);
    if(index != -1){
      return true;
    }
    return false;
  }

  async readUsers(): Promise<User[]> {
    const users = await this._storage?.get('users');
    if (!users) {
      await this.initUser();
      return await this._storage?.get('users');
    }

    return users;
  }

  async getUser(id: number): Promise<User>{
    let users:  User[] = await this.readUsers();
    if (!users) {
      await this.initUser();
    }


    const index = users.findIndex(x => x.id === id);
    if(index != -1){
      return users[index];
    }
    return null;
  }

  async addUser(user: User): Promise<void> {
    const users: User[] = await this._storage.get('users');
    const lastID = Math.max(...users.map(x => x.id));
    user.id = lastID + 1;
    users.push(user);

    await this._storage.set('users', users);
  }

  async updateUser(user: User): Promise<void> {
    const users: User[] = await this.storage.get('users');

    const index = users.findIndex(x => x.id === user.id);

    if (index > -1) {
      users[index] = user;
      await this._storage.set('users', users);
    }
  }

  async deleteUser(user: User): Promise<void> {
    const users: User[] = await this._storage.get('users');

    const index = users.findIndex(x => x.id === user.id);

    if (index > 1) {
      users.splice(index, 1);
      await this._storage.set('users', users);
    }
  }
}
