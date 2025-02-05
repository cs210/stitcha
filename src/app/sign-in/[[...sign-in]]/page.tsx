'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

export default function SignInPage() {
	return (
		<div className='grid w-full grow items-center px-4 sm:justify-center'>
			<SignIn.Root>
				<Clerk.Loading>
					{(isGlobalLoading) => (
						<>
							<SignIn.Step name='start'>
								<Card className='w-full sm:w-96'>
									<CardHeader className='text-center'>
										<CardTitle>Sign in to Stitcha</CardTitle>
										<CardDescription>Welcome back! Please sign in to continue</CardDescription>
									</CardHeader>
									<CardContent className='grid gap-y-4'>
										<Clerk.Field name='identifier' className='space-y-2'>
											<Clerk.Label asChild>
												<Label>Email address</Label>
											</Clerk.Label>
											<Clerk.Input type='email' required asChild>
												<Input />
											</Clerk.Input>
											<Clerk.FieldError className='block text-sm text-destructive' />
										</Clerk.Field>
									</CardContent>
									<CardFooter>
										<div className='grid w-full gap-y-4'>
											<SignIn.Action submit asChild>
												<Button disabled={isGlobalLoading}>
													<Clerk.Loading>
														{(isLoading) => {
															return isLoading ? <Icons.spinner className='size-4 animate-spin' /> : 'Continue';
														}}
													</Clerk.Loading>
												</Button>
											</SignIn.Action>
										</div>
									</CardFooter>
								</Card>
							</SignIn.Step>

							<SignIn.Step name='verifications'>
								<SignIn.Strategy name='password'>
									<Card className='w-full sm:w-96'>
										<CardHeader className='text-center'>
											<CardTitle>Enter your password</CardTitle>
											<CardDescription>Please enter your password to continue</CardDescription>
										</CardHeader>
										<CardContent className='grid gap-y-4'>
											<Clerk.Field name='password' className='space-y-2'>
												<Clerk.Label asChild>
													<Label>Password</Label>
												</Clerk.Label>
												<Clerk.Input type='password' asChild>
													<Input />
												</Clerk.Input>
												<Clerk.FieldError className='block text-sm text-destructive' />
											</Clerk.Field>
										</CardContent>
										<CardFooter>
											<div className='grid w-full gap-y-4'>
												<SignIn.Action submit asChild>
													<Button disabled={isGlobalLoading}>
														<Clerk.Loading>
															{(isLoading) => {
																return isLoading ? <Icons.spinner className='size-4 animate-spin' /> : 'Continue';
															}}
														</Clerk.Loading>
													</Button>
												</SignIn.Action>
											</div>
										</CardFooter>
									</Card>
								</SignIn.Strategy>
							</SignIn.Step>
						</>
					)}
				</Clerk.Loading>
			</SignIn.Root>
		</div>
	);
}
