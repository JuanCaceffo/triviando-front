'use client';

import AnimatedContainer, { AnimatedList } from '@/app/components/AnimatedContainer';
import NewTopicCard from './NewTopicCard';
import TopicCardLoader from './TopicCardLoader';
import TopicCard from '@/app/components/topic-card';
import { ITopic } from '../types';
import type { CreatingTopic } from '@/app/stores/topicCreationStore';

interface TopicsProps {
  topics: ITopic[];
  creatingTopics: CreatingTopic[];
  onGenerateTopic: (name: string) => Promise<void>;
  onGenerateFromFile: (name: string, file: File) => Promise<void> | void;
}

const Topics = ({
  topics,
  creatingTopics,
  onGenerateTopic,
  onGenerateFromFile,
}: TopicsProps) => {
  return (
    <AnimatedList
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      staggerDelay={0.1}
    >
      <AnimatedContainer key={'new-topic'} animation="slideUp" delay={0}>
        <NewTopicCard
          onGenerateTopic={onGenerateTopic}
          onGenerateFromFile={onGenerateFromFile}
        />
      </AnimatedContainer>

      {/* Render creating topics */}
      {creatingTopics.map((creatingTopic) => (
        <TopicCardLoader
          key={`creating-${creatingTopic.name}`}
          name={creatingTopic.name}
          progress={creatingTopic.progress}
        />
      ))}

      {topics.map((topic, index) => (
        <AnimatedContainer key={topic.name} animation="slideUp" delay={0.2 + index * 0.1}>
          <TopicCard topic={topic} />
        </AnimatedContainer>
      ))}
    </AnimatedList>
  );
};

export default Topics;
