import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



export interface documentImage{
  _id: string;
  name: string;
  createdDate: Date;
  url:string;
  blob: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentAPIService {
  url="http://127.0.0.1";
constructor(private http:HttpClient) { };


//maybe for the signatures
  getDocuments(){
    return this.http.get<documentImage[]>(`${this.url}/image`);
  }

  public static async testUploadDocument(file: File): Promise<boolean>
  {
    const formData = new FormData();
    formData.append('description', 'meow Meow Meow');
    formData.append('document', file);
    const response = await fetch(('http://localhost:3000/api/documents'), { //TODO: change this url
      method: 'POST',
      body: formData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: {'Content-Type': 'multipart/form-data'}
    });
    //Content-Type: multipart/form-data
    //'application/json; charset=UTF-8'

    if(response.ok)
    {return true;}
    else {return false;}
  }
}
