// Save this file at: src/pages/shop/components/HomeTemplates/HomeLayout.js
import React from 'react';
import styled from 'styled-components';
import EditableText from '../EditableComponents/EditableText';
import { Camera, Award, Calendar } from 'lucide-react';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const MissionSection = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin: 2rem 0;

  h2 {
    font-size: 1.8rem;
    color: ${props => props.theme?.colors?.accent};
    margin-bottom: 1.5rem;
  }
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeaturedItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .image {
    width: 100%;
    height: 250px;
    background: rgba(0, 0, 0, 0.2);
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .content {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }

  p {
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;

const TimelineSection = styled.div`
  margin: 4rem 0;
  padding: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    width: 2px;
    background: ${props => props.theme?.colors?.accent}40;
  }
`;

const Milestone = styled.div`
  display: flex;
  justify-content: ${props => props.position === 'left' ? 'flex-end' : 'flex-start'};
  padding: 2rem 0;
  width: 100%;

  .content {
    width: 45%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 20px;
      ${props => props.position === 'left' ? 'right: -40px' : 'left: -40px'};
      width: 40px;
      height: 2px;
      background: ${props => props.theme?.colors?.accent}40;
    }
  }

  .marker {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent};
    border: 4px solid ${props => props.theme?.colors?.background};
  }
`;

const HomeLayout = ({ shopData, onUpdate }) => {
  const featuredItems = shopData?.items?.slice(0, 3) || [];

  const milestones = [
    { id: 1, position: 'left', title: 'Shop Founded', date: '2023' },
    { id: 2, position: 'right', title: 'First Collection', date: '2024' },
    { id: 3, position: 'left', title: 'Community Growth', date: '2024' }
  ];

  return (
    <HomeContainer>
      <MissionSection>
        <h2>Our Mission</h2>
        <EditableText
          value={shopData?.mission}
          onChange={(value) => onUpdate({ mission: value })}
          placeholder="Share your shop's mission and vision..."
          multiline
        />
      </MissionSection>

      <FeaturedGrid>
        {featuredItems.map((item, index) => (
          <FeaturedItem key={item.id}>
            <div className="image">
              {item.images?.[0] && (
                <img src={item.images[0]} alt={item.name} />
              )}
            </div>
            <div className="content">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          </FeaturedItem>
        ))}
      </FeaturedGrid>

      <TimelineSection>
        {milestones.map((milestone) => (
          <Milestone key={milestone.id} position={milestone.position}>
            <div className="content">
              <h3>{milestone.title}</h3>
              <p>{milestone.date}</p>
            </div>
            <div className="marker" />
          </Milestone>
        ))}
      </TimelineSection>
    </HomeContainer>
  );
};

export default HomeLayout;