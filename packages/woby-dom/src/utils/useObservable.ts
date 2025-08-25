import { $, isObservable, type Observable, type ObservableMaybe } from 'woby'

export function useObservable<T>(value: ObservableMaybe<T> | T | null | undefined): Observable<T | null> {
    return (value && isObservable(value)
        ? value as Observable<T | null>
        : $<T | null>(value || null)) as Observable<T | null>
}