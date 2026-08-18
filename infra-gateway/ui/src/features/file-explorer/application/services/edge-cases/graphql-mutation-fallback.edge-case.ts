export class GraphqlMutationFallbackEdgeCase {
  public static ShouldFallbackToRest(graphqlResult: { success: boolean; error?: string }): boolean {
    if (!graphqlResult.success) return true;
    if (graphqlResult.error && graphqlResult.error.length > 0) return true;
    return false;
  }
}
