interface Props {
  cartIssue: string | null;
  authIssue: string | null;
}

export function StorageNotice({ cartIssue, authIssue }: Props) {
  if (cartIssue === null && authIssue === null) return null;

  return (
    <div className="container storage-notice" role="alert">
      {cartIssue !== null ? (
        <p>
          <strong>Cart:</strong> {cartIssue}
        </p>
      ) : null}
      {authIssue !== null ? (
        <p>
          <strong>Account:</strong> {authIssue}
        </p>
      ) : null}
    </div>
  );
}
