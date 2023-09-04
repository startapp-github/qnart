import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private URL = 'http://info.sweettracker.co.kr';
  private apiKey = 't_key=7fjMvKFWKECNrsRGdIL23A';
  private header = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    accept: 'application/json;charset=UTF-8',
  };

  constructor(private http: HttpClient) {}

  companyApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(
        '${this.URL}/api/v1/companylist?${this.apiKey}',
        `${this.URL}/api/v1/companylist?${this.apiKey}`
      );
      this.http.get(`${this.URL}/api/v1/companylist?${this.apiKey}`).subscribe(
        (data) => {
          console.log({ data });

          resolve(data);
        },
        (error) => {
          console.log({ error });
          reject(error);
        }
      );
    });
  }
  trackingInfo(code: string, invoice: number): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(
        '${this.URL}/api/v1/trackingInfo?t_code=${code}&t_invoice=${invoice}&${this.apiKey}',
        `${this.URL}/api/v1/trackingInfo?t_code=${code}&t_invoice=${invoice}&${this.apiKey}`
      );

      this.http
        .get(
          `${this.URL}/api/v1/trackingInfo?t_code=${code}&t_invoice=${invoice}&${this.apiKey}`
        )
        .subscribe(
          (data: any) => {
            const info = data.code ? data : data.trackingDetails?.reverse();

            resolve(info);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
}
