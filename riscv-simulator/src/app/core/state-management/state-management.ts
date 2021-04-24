import {Observable, BehaviorSubject} from 'rxjs';

// https://dev.to/angular/simple-yet-powerful-state-management-in-angular-with-rxjs-4f8g
export class Store<T> {
    state$: Observable<T>;
    private _state$: BehaviorSubject<T>;

    protected constructor (initialState: T) {
        this._state$ = new BehaviorSubject(initialState);
        this.state$ = this._state$.asObservable();
    }

    protected get state (): T {
        return this._state$.getValue();
    }

    protected setState (nextState: T): void {
        this._state$.next(nextState);
    }
}
