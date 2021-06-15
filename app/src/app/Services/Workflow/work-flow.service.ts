import { Injectable } from '@angular/core';
import { User } from './../User/user-api.service';
import { documentImage } from './../Document/document-api.service';

export interface Comments{
  comment: string;
  user: User;
}


export interface WorkFlow{
  name: String;
  description: string;
  documents: documentImage;
  comments: Comments[];
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkFlowService {

  constructor() { }
}
