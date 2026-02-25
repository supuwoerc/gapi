export const codeSnippets = [
  `type APIEndpoint struct {
    ID          string                 
    Name        string                 
    Path        string                 
    Method      string                 
    Description string                 
    Status      string                 
    CreatedAt   time.Time              
    UpdatedAt   time.Time              
    Request     map[string]interface{} 
    Response    map[string]interface{} 
    Metadata    map[string]string      
}`,

  `public class ApiEndpoint {
    private String id;
    private String name;
    private String path;
    private String method;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> request;
    private Map<String, Object> response;
    private Map<String, String> metadata;
}`,

  `interface APIEndpoint {
    id: string;
    name: string;
    path: string;
    method: string;
    description?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    request: Record<string, any>;
    response: Record<string, any>;
    metadata?: Record<string, string>;
}`,
]

export const langs = ['go', 'java', 'typescript']
