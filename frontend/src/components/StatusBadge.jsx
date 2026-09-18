const StatusBadge = ({ status, daysRemaining }) => {
  let badgeClass = '';
  let dotClass = '';
  let text = '';

  if (status === 'ELIGIBLE_NOW') {
    badgeClass =
      'bg-[#EEF7F0] text-[#3F7652] border-[#BBD8C3]';
    dotClass = 'bg-[#4F8A62]';
    text = 'POTENTIALLY ELIGIBLE';

  } else if (status === 'NOT_YET_ELIGIBLE') {
    if (
      daysRemaining !== undefined &&
      daysRemaining !== null &&
      daysRemaining <= 30
    ) {
      badgeClass =
        'bg-[#FFF6E8] text-[#8A5B16] border-[#E7C98F]';
      dotClass = 'bg-[#B97820]';
      text = 'APPROACHING THRESHOLD';

    } else {
      badgeClass =
        'bg-[#FFF0F0] text-[#A63D3D] border-[#E4B7B7]';
      dotClass = 'bg-[#B94343]';
      text = 'NOT YET ELIGIBLE';
    }

  } else if (status === 'EXCLUDED') {
    badgeClass =
      'bg-[#FFF0F0] text-[#A63D3D] border-[#E4B7B7]';
    dotClass = 'bg-[#B94343]';
    text = 'EXCLUDED';

  } else {
    badgeClass =
      'bg-[#FFF9F5] text-[#5E4B40] border-[#D8B9A0]';
    dotClass = 'bg-[#806F64]';
    text = status || 'UNKNOWN';
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${badgeClass}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${dotClass}`}
      ></span>

      {text}
    </span>
  );
};

export default StatusBadge;