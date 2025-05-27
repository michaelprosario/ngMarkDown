# ngMarkDown - Angular Markdown Editor

A responsive, feature-rich Markdown editor web application built with Angular and Bootstrap. This application allows users to create, edit, preview, save, and manage markdown files locally in the browser using IndexedDB.

## UI Layout

```mermaid
graph TD
    subgraph "App Layout"
        Header["Header Component<br>(App title, New File, Import)"]
        Main["Main Content Area"]
        Footer["Footer"]
    end
    
    subgraph "Main Content Area"
        FileList["File List Component<br>(Left Sidebar)"]
        EditArea["Editor Component<br>(Middle)"]
        PreviewArea["Preview Component<br>(Right)"]
    end
    
    subgraph "Editor Component"
        FileName["File Name Input"]
        ToolbarComponent["Toolbar Component<br>(Formatting buttons)"]
        EditorTextArea["Markdown Text Area"]
    end
    
    Header --- Main
    Main --- Footer
    Main --- FileList
    Main --- EditArea
    Main --- PreviewArea
    EditArea --- FileName
    EditArea --- ToolbarComponent
    EditArea --- EditorTextArea
    
    classDef layout fill:#f9f9f9,stroke:#333,stroke-width:1px
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:1px,color:#01579b
    
    class Header,Main,Footer layout
    class FileList,EditArea,PreviewArea,FileName,ToolbarComponent,EditorTextArea component
```

## Application Diagrams

### Component Architecture

```mermaid
graph TD
    A[App Component] --> B[Header Component]
    A --> C[File List Component]
    A --> D[Editor Component]
    A --> E[Preview Component]
    D --> F[Toolbar Component]
    
    G[MarkdownService] <--> C
    G <--> D
    B <--> G
    G <--> I[(IndexedDB)]
    
    D -- contentChanged --> E
    F -- format --> D
    B -- fileImported --> A
    
    J[MarkdownFile Model] <- G
    J <- C
    J <- D

    classDef service fill:#f9f,stroke:#333,stroke-width:2px
    classDef component fill:#bbf,stroke:#333,stroke-width:1px
    classDef model fill:#bfb,stroke:#333,stroke-width:1px
    classDef database fill:#fbb,stroke:#333,stroke-width:2px
    
    class A,B,C,D,E,F component
    class G service
    class J model
    class I database
```

### User Stories Diagram

```mermaid
graph LR
    User((User)) --> AU[Authoring]
    User --> FM[File Management]
    User --> UI[User Interface]
    User --> DM[Data Management]
    User --> EH[Error Handling]
    
    subgraph "Authoring Markdown"
        AU1[Enter Markdown Content]
        AU2[Name & Save Files]
        AU3[See Live Preview]
        AU4[Auto-save to IndexedDB]
    end
    
    subgraph "File Management"
        FM1[Create New Files]
        FM2[View File List]
        FM3[Load Saved Files]
        FM4[Delete Files]
        FM5[Rename Files]
    end
    
    subgraph "User Interface"
        UI1[Responsive Bootstrap Layout]
        UI2[Editor/Preview Separation]
        UI3[Markdown Toolbar]
    end
    
    subgraph "Data Management"
        DM1[IndexedDB Storage]
        DM2[Export Files]
        DM3[Import Files]
    end
    
    subgraph "Error Handling"
        EH1[Save Error Notifications]
        EH2[Delete Confirmations]
    end
    
    AU --> AU1
    AU --> AU2
    AU --> AU3
    AU --> AU4
    
    FM --> FM1
    FM --> FM2
    FM --> FM3
    FM --> FM4
    FM --> FM5
    
    UI --> UI1
    UI --> UI2
    UI --> UI3
    
    DM --> DM1
    DM --> DM2
    DM --> DM3
    
    EH --> EH1
    EH --> EH2
    
    classDef userStory fill:#e1f5fe,stroke:#01579b,stroke-width:1px
    classDef category fill:#fff9c4,stroke:#fbc02d,stroke-width:1px
    
    class AU,FM,UI,DM,EH category
    class AU1,AU2,AU3,AU4,FM1,FM2,FM3,FM4,FM5,UI1,UI2,UI3,DM1,DM2,DM3,EH1,EH2 userStory
```

## Application Design

### Architecture

The application follows a component-based architecture with a clear separation of concerns:

- **Models**: Define data structures using TypeScript classes
- **Services**: Handle data operations and business logic
- **Components**: Build UI and handle user interactions

### Component Structure

The application is divided into several key components:

- **Header Component**: Contains app title and actions for creating new files and importing markdown
- **File List Component**: Displays saved files with options to load, rename, export, and delete
- **Editor Component**: Provides a text area for writing markdown with auto-save functionality
- **Preview Component**: Shows real-time rendered markdown preview
- **Toolbar Component**: Offers formatting buttons for common markdown syntax

### Class-Based Design

The application uses TypeScript classes for strong typing and better code organization:

```mermaid
classDiagram
    class MarkdownFile {
        +id?: number
        +name: string
        +content: string
        +createdAt: Date
        +updatedAt: Date
        +constructor(id?, name, content, createdAt, updatedAt)
    }
    
    class MarkdownDatabase {
        +markdownFiles: Dexie.Table<MarkdownFile, number>
        +constructor()
    }
    
    class MarkdownService {
        -db: MarkdownDatabase
        -currentFile: BehaviorSubject<MarkdownFile>
        -initialized: boolean
        +constructor()
        +getCurrentFile(): Observable<MarkdownFile>
        +setCurrentFile(file: MarkdownFile): void
        +getFiles(): Promise<MarkdownFile[]>
        +getFileById(id: number): Promise<MarkdownFile>
        +createFile(file: MarkdownFile): Promise<number>
        +updateFile(file: MarkdownFile): Promise<number>
        +deleteFile(id: number): Promise<void>
        +renameFile(id: number, name: string): Promise<number>
        +exportFile(id: number): Promise<string>
        -initDatabase(): Promise<void>
    }
    
    class MarkdownFormatEvent {
        +prefix: string
        +suffix: string
    }
    
    MarkdownDatabase --|> Dexie: extends
    MarkdownService "1" --o "1" MarkdownDatabase: uses
    MarkdownService "1" --> "*" MarkdownFile: manages
    MarkdownService -- MarkdownFormatEvent: uses
```

Example implementation:

```typescript
// Example of the MarkdownFile model class
export class MarkdownFile {
  constructor(
    public id?: number,
    public name: string = 'Untitled',
    public content: string = '',
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

// Database class using Dexie.js
export class MarkdownDatabase extends Dexie {
  markdownFiles!: Dexie.Table<MarkdownFile, number>;

  constructor() {
    super('MarkdownDatabase');
    this.version(1).stores({
      markdownFiles: '++id, name, content, createdAt, updatedAt'
    });
  }
}
```

### Key Features

1. **Real-time Markdown Preview**: See rendered markdown as you type
2. **Local Storage with IndexedDB**: Files are saved automatically using Dexie.js
3. **Responsive Design**: Bootstrap-based UI works on desktop and mobile devices
4. **File Management**: Create, rename, delete, import, and export markdown files
5. **Markdown Toolbar**: Quickly insert common markdown syntax elements
6. **Auto-Save**: Content is saved automatically during editing

### Technologies Used

- **Angular 14**: Front-end framework
- **Bootstrap 5**: UI framework for responsive design 
- **Marked.js**: Markdown to HTML parser
- **Dexie.js**: IndexedDB wrapper for browser storage
- **Bootstrap Icons**: For UI icons

### Data Flow Diagram

The following sequence diagram illustrates the key user interactions and the resulting data flow between components:

```mermaid
sequenceDiagram
    participant User
    participant Header as Header Component
    participant Editor as Editor Component
    participant Preview as Preview Component
    participant FileList as File List Component
    participant Service as Markdown Service
    participant DB as IndexedDB
    
    User->>Header: Click "New File"
    Header->>Service: Create new file
    Service->>Editor: Update current file
    
    User->>Editor: Type markdown content
    Editor->>Preview: Send content (contentChanged)
    Preview->>Preview: Render markdown
    Editor->>Service: Auto-save (debounced)
    Service->>DB: Store file
    
    User->>FileList: Click saved file
    FileList->>Service: Request file
    Service->>DB: Fetch file
    DB->>Service: Return file
    Service->>Editor: Update current file
    Editor->>Preview: Send content
    
    User->>Header: Import file
    Header->>Service: Store imported file
    Service->>FileList: Update file list
    Service->>Editor: Update current file
    
    User->>FileList: Export file
    FileList->>Service: Get file
    Service->>User: Download file
```

This diagram shows the key interactions and data flow paths:
1. Creating a new file
2. Editing and auto-saving markdown content
3. Real-time preview updating
4. Loading saved files
5. Importing and exporting files

## Development

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
