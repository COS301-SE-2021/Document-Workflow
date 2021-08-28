import { Injectable } from '@angular/core';

export enum LogLevel {
  Error,
  Warning,
  Info,
  Debug,
  Brent,
  Mosa,
  Tim,
  Delaray,
}

@Injectable()
export class Logger {
  debug: boolean = true;

  debugWorkflow: boolean = true;
  debugEditWorkflow: boolean = true;
  debugAddWorkflow: boolean = true;
  debugTemplateWorkflow: boolean= true;

  constructor() {}

  public Error(str: any) {
    this.log(str, '', 'Error');
  }

  public Warning(str: any) {
    this.log(str, '', 'warn');
  }

  public Info(str: any) {
    this.log(str, '', 'info');
  }

  public Debug(str: any) {
    this.log(str, '', 'debug');
  }

  public WorkflowHome(str:any){
    if(this.debugWorkflow)
      this.log(str,'','');
  }

  public WorkflowEdit(str:any){
    if(this.debugEditWorkflow)
      this.log(str,'','');
  }

  public WorkflowAdd(str:any){
    if(this.debugAddWorkflow)
      this.log(str,'','');
  }

  public WorkflowTemplate(str:any){
    if(this.debugTemplateWorkflow)
      this.log(str,'','');
  }

  public Brent(str: any) {
    const css: string = 'color: #556B2F; display: block';
    this.log(str, css, 'log');
  }

  public Tim(str: any) {
    const css: string = 'color: #ee82ee;display: block';
    this.log(str, css, 'log');
  }

  public Mosa(str: any) {
    const css: string = ' color: #bada55;display: block';
    this.log(str, css, 'log');
  }

  public Delaray(str: any) {
    const css: string = 'color: #96ddff;display: block';
    this.log(str, css, 'log');
  }

  private log(str: any, css: string, level: string) {
    if (this.debug === true) {
      switch (level) {
        case 'log':
          console.log('%c '+str, css);
          break;
        case 'debug':
          console.debug(str);
          break;
        case 'warn':
          console.warn(str);
          break;
        case 'error':
          console.error(str);
          break;
      }
    }
  }
}
