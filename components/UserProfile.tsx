/* eslint-disable @next/next/no-img-element */
export default function UserProfile({ user }: { user: any }) {
  return (
    <div className="box-center">
      <img src={user.photoURL} className="card-img-center" alt="User Photo" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  );
}
