# Quick Start Guide - Layered Architecture

This guide helps you quickly understand and work with the new layered architecture.

## 📚 Understanding the Layers

### Where to Put Your Code?

#### ✅ Adding a new UI component?
→ **Presentation Layer** (`src/app/presentation/components/`)

#### ✅ Adding business logic or workflow?
→ **Application Layer** (`src/app/application/use-cases/`)

#### ✅ Defining core business rules or entities?
→ **Domain Layer** (`src/app/domain/entities/`)

#### ✅ Integrating with external API or service?
→ **Infrastructure Layer** (`src/app/infrastructure/services/`)

#### ✅ Adding a constant or utility function?
→ **Core Layer** (`src/app/core/`)

---

## 🚀 Common Tasks

### Task 1: Display Data in UI

**What you need:**
1. Get data from Facade in Component
2. Update ViewModel
3. Display in Template

**Example:**
```typescript
// 1. In Component (Presentation Layer)
export class MyComponent {
  constructor(private facade: SegmentationFacade) {}
  
  loadData(): void {
    this.facade.getAvailableModels().subscribe({
      next: (models) => {
        this.vm.availableModels = models; // 2. Update ViewModel
      }
    });
  }
}

// 3. In Template
<select [(ngModel)]="selectedModel">
  <option *ngFor="let model of vm.availableModels" [value]="model">
    {{ model }}
  </option>
</select>
```

---

### Task 2: Add a New API Endpoint

**Steps:**
1. Add method to Domain Interface
2. Implement in Infrastructure Service
3. Create Use Case in Application Layer
4. Add method to Facade
5. Call from Component

**Example: Add "Get Segmentation History"**

```typescript
// Step 1: Domain Interface (domain/interfaces/segmentation-repository.interface.ts)
export interface ISegmentationRepository {
  getHistory(): Observable<SegmentationEntity[]>;
}

// Step 2: Infrastructure Service (infrastructure/services/http-segmentation.service.ts)
getHistory(): Observable<SegmentationEntity[]> {
  return this.http.get<ApiSegmentationResponse[]>(`${this.baseUrl}/history`)
    .pipe(
      map(responses => responses.map(r => 
        SegmentationResponseAdapter.toSegmentationEntity(r, /* image */)
      ))
    );
}

// Step 3: Use Case (application/use-cases/get-history.use-case.ts)
@Injectable({ providedIn: 'root' })
export class GetHistoryUseCase {
  constructor(private repository: ISegmentationRepository) {}
  
  execute(): Observable<SegmentationResponseDto[]> {
    return this.repository.getHistory().pipe(
      map(entities => entities.map(e => this.toDto(e)))
    );
  }
}

// Step 4: Facade (application/facades/segmentation.facade.ts)
getHistory(): Observable<SegmentationResponseDto[]> {
  return this.getHistoryUseCase.execute();
}

// Step 5: Component (presentation/components/...)
loadHistory(): void {
  this.segmentationFacade.getHistory().subscribe({
    next: (history) => this.vm.history = history
  });
}
```

---

### Task 3: Add Validation Logic

**What you need:**
1. Add validation to Value Object or Entity (Domain)
2. Use in Use Case (Application)
3. Display error in Component (Presentation)

**Example: Validate file size**

```typescript
// 1. Domain - Value Object (domain/value-objects/image-file.vo.ts)
export class ImageFile {
  private constructor(private file: File) {}
  
  static create(file: File): ImageFile {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large');
    }
    return new ImageFile(file);
  }
}

// 2. Application - Use Case (application/use-cases/upload-image.use-case.ts)
execute(file: File): Observable<ImageUploadDto> {
  try {
    const imageFile = ImageFile.create(file); // Validates
    return this.repository.uploadImage(file);
  } catch (error) {
    return throwError(() => error);
  }
}

// 3. Presentation - Component
uploadImage(): void {
  this.facade.uploadImage(this.vm.selectedFile).subscribe({
    error: (error) => {
      this.vm.errorMessage = error.message; // Display error
    }
  });
}
```

---

### Task 4: Add a New Business Rule

**What you need:**
1. Add method to Entity (Domain)
2. Use in Use Case (Application)
3. Call from Component (Presentation)

**Example: Check if segmentation can be retried**

```typescript
// 1. Domain Entity (domain/entities/segmentation.entity.ts)
export class SegmentationEntity {
  canRetry(): boolean {
    return this.hasFailed() && this.getProcessingDuration() < 300; // < 5 min
  }
}

// 2. Application Use Case (application/use-cases/retry-segmentation.use-case.ts)
@Injectable({ providedIn: 'root' })
export class RetrySegmentationUseCase {
  execute(segmentationId: string): Observable<SegmentationResponseDto> {
    const entity = /* get entity by id */;
    
    if (!entity.canRetry()) {
      throw new Error('Cannot retry this segmentation');
    }
    
    return this.repository.performSegmentation(entity);
  }
}

// 3. Presentation Component
retrySegmentation(): void {
  this.facade.retry(this.vm.segmentationResult.id).subscribe({
    next: (result) => this.vm.segmentationResult = result
  });
}
```

---

## 🎯 Quick Reference

### Importing from Layers

Always use index files for cleaner imports:

```typescript
// ❌ Bad
import { ModelType } from '../../domain/value-objects/model-type.vo';
import { ImageEntity } from '../../domain/entities/image.entity';

// ✅ Good
import { ModelType, ImageEntity } from '../../domain';
```

### Dependency Direction

```
Remember the flow:
Presentation → Application → Domain ← Infrastructure
                                ↓
                              Core
```

**Rules:**
- Presentation can import from: Application, Domain, Core
- Application can import from: Domain, Core
- Domain can import from: Core (minimal)
- Infrastructure can import from: Domain, Core
- Core imports from: Nothing (self-contained)

### Layer Responsibilities

| Layer | Responsible For | NOT Responsible For |
|-------|----------------|---------------------|
| **Presentation** | UI, user interactions, displaying data | Business logic, API calls |
| **Application** | Orchestrating workflows, use cases | UI, direct HTTP calls |
| **Domain** | Business rules, entities, validation | HTTP, Angular, UI |
| **Infrastructure** | API calls, external services | Business logic |
| **Core** | Utilities, configuration, constants | Business logic, UI |

---

## 🛠️ Common Patterns

### 1. Creating a New Entity

```typescript
// domain/entities/my-entity.entity.ts
export class MyEntity {
  constructor(
    private readonly _id: string,
    private _status: string
  ) {}
  
  static create(id: string): MyEntity {
    return new MyEntity(id, 'INITIAL');
  }
  
  get id(): string { return this._id; }
  get status(): string { return this._status; }
  
  // Business methods
  activate(): void {
    if (this._status !== 'INITIAL') {
      throw new Error('Cannot activate');
    }
    this._status = 'ACTIVE';
  }
}
```

### 2. Creating a Use Case

```typescript
// application/use-cases/my-action.use-case.ts
@Injectable({ providedIn: 'root' })
export class MyActionUseCase {
  constructor(private repository: IMyRepository) {}
  
  execute(input: InputDto): Observable<OutputDto> {
    // 1. Validate input
    // 2. Call repository
    // 3. Convert to DTO
    // 4. Return
  }
}
```

### 3. Adding to Facade

```typescript
// application/facades/my.facade.ts
@Injectable({ providedIn: 'root' })
export class MyFacade {
  constructor(
    private useCase1: UseCase1,
    private useCase2: UseCase2
  ) {}
  
  doSomething(): Observable<ResultDto> {
    return this.useCase1.execute();
  }
  
  // Combine multiple use cases
  doComplexThing(): Observable<ResultDto> {
    return this.useCase1.execute().pipe(
      switchMap(result => this.useCase2.execute(result))
    );
  }
}
```

### 4. Creating a Component

```typescript
// presentation/components/my/my.component.ts
@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my.component.html',
  styleUrl: './my.component.css'
})
export class MyComponent {
  vm: MyViewModel = { /* initial state */ };
  
  constructor(private facade: MyFacade) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.facade.getData().subscribe({
      next: (data) => this.vm.data = data,
      error: (error) => this.vm.error = error.message
    });
  }
}
```

---

## 🐛 Debugging Tips

### Problem: "Cannot find module"
**Solution:** Check if you're importing from index files and the path is correct.

### Problem: "Circular dependency detected"
**Solution:** You're probably importing from a higher layer. Check dependency rules.

### Problem: "NullInjectorError: No provider for..."
**Solution:** Add the provider to `core/providers/app.providers.ts`

### Problem: "Cannot read property of undefined"
**Solution:** Check if DTO properties match entity properties in adapters

---

## 📝 Checklist for New Feature

- [ ] Define domain entity/value object (if needed)
- [ ] Add method to domain interface (if calling external service)
- [ ] Implement in infrastructure service
- [ ] Create use case with business logic
- [ ] Add to facade
- [ ] Update component and view model
- [ ] Add to template
- [ ] Write tests
- [ ] Update documentation

---

## 📖 Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration from old structure
- [README.md](./README.md) - Project overview

---

*Happy Coding! 🚀*

