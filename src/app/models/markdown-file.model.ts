export class MarkdownFile {
  constructor(
    public id?: number,
    public name: string = 'Untitled',
    public content: string = '',
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
