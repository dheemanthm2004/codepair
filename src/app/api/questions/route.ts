import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Mock questions data (you can move this to database later)
const MOCK_QUESTIONS = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'easy',
    category: 'Array',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
    ],
    constraints: '2 ≤ nums.length ≤ 10^4',
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    return [];
}`,
      java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
    return new int[]{};
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}`,
    },
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'easy',
    category: 'Stack',
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    starterCode: {
      javascript: `function isValid(s) {
    // Your code here
}`,
      python: `def is_valid(s):
    # Your code here
    pass`,
      typescript: `function isValid(s: string): boolean {
    // Your code here
    return false;
}`,
    },
  },
  {
    title: 'Merge Two Sorted Lists',
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted fashion.',
    difficulty: 'easy',
    category: 'Linked List',
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]',
      },
    ],
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {
    // Your code here
}`,
      python: `def merge_two_lists(list1, list2):
    # Your code here
    pass`,
    },
  },
  {
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '[4,-1,2,1] has the largest sum = 6.',
      },
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
    // Your code here
}`,
      python: `def max_sub_array(nums):
    # Your code here
    pass`,
    },
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'easy',
    category: 'Dynamic Programming',
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1+1 steps, 2 steps',
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways: 1+1+1, 1+2, 2+1',
      },
    ],
    starterCode: {
      javascript: `function climbStairs(n) {
    // Your code here
}`,
      python: `def climb_stairs(n):
    # Your code here
    pass`,
    },
  },
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    let questions = MOCK_QUESTIONS;

    // Filter by difficulty
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    // Filter by category
    if (category) {
      questions = questions.filter(q => q.category === category);
    }

    // Limit results
    questions = questions.slice(0, limit);

    return NextResponse.json({
      questions: questions.map((q, index) => ({
        id: `mock-${index}`,
        ...q,
      })),
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}