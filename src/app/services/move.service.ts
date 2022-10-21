import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MoveService {

  draggedItem:any = new BehaviorSubject<any>([]);
  dropPoint:any = new BehaviorSubject<any>({});
  constructor() { }

  getDraggedItems(){
    return this.draggedItem.asObservable();
  }

  setDraggedItems(temp: any){
    return this.draggedItem.next(temp);
  }
  getDropPoint(){
    return this.dropPoint.asObservable();
  }

  setDropPoint(temp: any){
    return this.dropPoint.next(temp);
  }
}
