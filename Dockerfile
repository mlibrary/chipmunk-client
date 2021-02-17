FROM ruby:2.5 as base

RUN gem install bundler

ENV APP_PATH /app
RUN mkdir -p $APP_PATH
WORKDIR $APP_PATH
COPY Gemfile Gemfile.lock ./
RUN bundle install
ENV RUN_INTEGRATION 1

FROM base as build
COPY . ./

