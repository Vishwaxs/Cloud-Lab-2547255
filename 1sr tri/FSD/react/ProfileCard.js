function ProfileCard({ title, handle, image }) {
  return (
    <div className="bg-pink-50 rounded-xl shadow-md p-4 m-4 w-64 text-center border border-pink-800">
      {image ? (
        <img
          src={image}
          alt="card visual"
          className="w-42 h-42 object-contain mx-auto mb-4"
        />
      ) : (
        <div className="w-42 h-42 flex items-center justify-center bg-gray-200 text-gray-500 mx-auto mb-4 rounded">
          No Image
        </div>
      )}
      <hr className="text-black"/>
      <div className="text-lg font-semibold text-gray-800">{title}</div>
      <div className="text-sm text-gray-500">{handle}</div>
    </div>
  );
}

export default ProfileCard;
