import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterRouteName'
})
export class FilterRouteNamePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let reg = /\W\d\d DAY.*/g;
    value = value.replace(reg, '');
    let reg_ = /\W\d\d day.*/g;
    value = value.replace(reg_, '');
    value = value.replace(/]/g,'] ')
    console.log(value);
    let reg2 = /\[.*\]/g;
    let str2 = value.replace(reg2,'');
    str2 = str2.replace(/-/g,'')
    return str2.trim();
  }

}
