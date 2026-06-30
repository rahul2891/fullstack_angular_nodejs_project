import { inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, first, map, of, switchMap } from 'rxjs';
import { IssuesApiService } from '../../core/services/issues-api.service';

export function uniqueIssueTitleValidator(
  projectId: () => string | null,
  excludeId?: () => string | undefined
): AsyncValidatorFn {
  const issuesApi = inject(IssuesApiService);

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const title = (control.value ?? '').trim();
    const currentProjectId = projectId();

    if (!title || title.length < 3 || !currentProjectId) {
      return of(null);
    }

    return of(title).pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(() =>
        issuesApi.checkTitleAvailable(currentProjectId, title, excludeId?.())
      ),
      map((res) => (res.available ? null : { titleTaken: true })),
      first()
    );
  };
}
