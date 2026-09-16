import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import styled from 'styled-components';
const BrandName = styled.span`
	font-size: 2.5rem;
	font-weight: 700;
	letter-spacing: -0.02em;
	color: #ffffff;
`;

export default function LoadingScreen() {
	const [open] = React.useState(true);
	/*  const handleClose = () => {
    setOpen(false);
  }; */
	return (
		<div>
			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={open}
				//onClick={handleClose}
			>
				<BrandName>Taskzen</BrandName>
			</Backdrop>
		</div>
	);
}
