interface HeaderProps {
  heading: string;
  subheading: string;
}

const Header = ({ heading, subheading }: HeaderProps) => {
  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h1>
      <p className="text-gray-600">{subheading}</p>
    </div>
  )
}

export default Header;