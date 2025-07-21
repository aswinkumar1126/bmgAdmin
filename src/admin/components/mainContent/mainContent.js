import DashboardCards from '../cards/DashboardCards';
import ChartsSectionWrapper from '../charts/ChartsSectionWrapper';
import Welcome from '../common/welcome';

const MainContent = () => {

    return (
        <main>   
            <Welcome />   
            <DashboardCards />
            {/* <ChartsSectionWrapper /> */}
        </main>
    );
};

export default MainContent;