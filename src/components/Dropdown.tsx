export default function Dropdown({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute bottom-full ml-8 object-center right-0 mb-8 min-w-[270px] backdrop-blur-lg bg-[#f5f5f5]/90 border-[1px] border-gray-400 rounded-[12px] shadow-lg overflow-hidden z-50"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabIndex={-1}
    >
      <div className="py-1" role="none">
                <a
          href="https://github.com/izulhq/our-adventure"
          className="block px-6 py-2 text-sm text-black hover:bg-white transition-colors"
          role="menuitem"
        >
          View Source Code
        </a>
        <a
          href="https://gis.izulhq.me/klimatologi"
          className="block px-6 py-2 text-sm text-black hover:bg-white transition-colors"
          role="menuitem"
        >
          Peta Klimatologi
        </a>
        <a
          href="https://gis.izulhq.me/gsheets"
          className="block px-6 py-2 text-sm text-black hover:bg-white transition-colors"
          role="menuitem"
        >
          Leaflet x GSheets
        </a>
        <a
          href="https://gis.izulhq.me/klimatologi"
          target="_blank"
          className="block px-6 py-2 text-sm text-black hover:bg-white transition-colors"
          role="menuitem"
        >
          Peta Klimatologi
        </a>
        <a
          href="https://gis.izulhq.me"
          className="block px-6 py-2 text-sm text-black hover:bg-white transition-colors"
          role="menuitem"
        >
          Back to Home
        </a>
      </div>
      <div className="border-t border-black-400" role="none">
        <div className="grid grid-cols-2">
          <a
            href="https://leafletjs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 text-xs text-center text-gray-600 hover:bg-white transition-colors"
            role="menuitem"
          >
            Leaflet Maps
          </a>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 text-xs text-center text-gray-600 hover:bg-white transition-colors"
            role="menuitem"
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
}
