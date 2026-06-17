import React from "react";

export const EditIcon = ({ className = "w-[24px] h-[24px]" }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.9459 3.17305C17.5332 2.58578 17.8268 2.29215 18.1521 2.15173C18.6208 1.94942 19.1521 1.94942 19.6208 2.15173C19.946 2.29215 20.2397 2.58578 20.8269 3.17305C21.4142 3.76032 21.7079 4.05395 21.8483 4.37925C22.0506 4.8479 22.0506 5.37924 21.8483 5.84789C21.7079 6.17319 21.4142 6.46682 20.8269 7.05409L15.8054 12.0757C14.5682 13.3129 13.9496 13.9315 13.1748 14.298C12.4 14.6645 11.5294 14.7504 9.78823 14.9222L9 15L9.07778 14.2118C9.24958 12.4706 9.33549 11.6 9.70201 10.8252C10.0685 10.0504 10.6871 9.43183 11.9243 8.19464L16.9459 3.17305Z"
      stroke="#6C6C6C"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M6 15H3.75C2.7835 15 2 15.7835 2 16.75C2 17.7165 2.7835 18.5 3.75 18.5H13.25C14.2165 18.5 15 19.2835 15 20.25C15 21.2165 14.2165 22 13.25 22H11"
      stroke="#6C6C6C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TrashIcon = ({ className = "w-[24px] h-[24px]" }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
      stroke="#E53935"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9 11.7349H15"
      stroke="#E53935"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10.5 15.6543H13.5"
      stroke="#E53935"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M3 5.5H21M16.0555 5.5L15.3729 4.09173C14.9194 3.15626 14.6926 2.68852 14.3015 2.39681C14.2148 2.3321 14.1229 2.27454 14.0268 2.2247C13.5937 2 13.0739 2 12.0343 2C10.9686 2 10.4358 2 9.99549 2.23412C9.89791 2.28601 9.80479 2.3459 9.7171 2.41317C9.32145 2.7167 9.10044 3.20155 8.65842 4.17126L8.05273 5.5"
      stroke="#E53935"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const CalendarIcon = ({ className = "w-[18px] h-[18px]" }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3 6.75C3 5.42434 3 4.7615 3.25793 4.25478C3.48473 3.80905 3.80905 3.48473 4.25478 3.25793C4.7615 3 5.42434 3 6.75 3H11.25C12.5757 3 13.2385 3 13.7452 3.25793C14.191 3.48473 14.5153 3.80905 14.7421 4.25478C15 4.7615 15 5.42434 15 6.75V11.25C15 12.5757 15 13.2385 14.7421 13.7452C14.5153 14.191 14.191 14.5153 13.7452 14.7421C13.2385 15 12.5757 15 11.25 15H6.75C5.42434 15 4.7615 15 4.25478 14.7421C3.80905 14.5153 3.48473 14.191 3.25793 13.7452C3 13.2385 3 12.5757 3 11.25V6.75Z"
      stroke="#6C6C6C"
      strokeWidth="1.25"
    />
    <path
      d="M3 6H15"
      stroke="#6C6C6C"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M6 2V4"
      stroke="#6C6C6C"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M12 2V4"
      stroke="#6C6C6C"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

export const CheckmarkIcon = ({ className }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CloseCircleIcon = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M14.9994 15L9 9M9.00064 15L15 9"
      stroke="#121212"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
      stroke="#121212"
      strokeWidth="1.5"
    />
  </svg>
);
